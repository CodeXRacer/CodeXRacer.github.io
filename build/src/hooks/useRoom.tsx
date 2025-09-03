import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Room {
  id: string;
  room_code: string;
  name: string;
  language: string;
  status: string;
  max_players: number;
  created_at: string;
  created_by?: string;
  code_snippet: string;
}

export interface RoomParticipant {
  id: string;
  room_id: string;
  user_id?: string;
  guest_name?: string;
  progress: number;
  wpm: number;
  accuracy: number;
  finished_at?: string;
  position?: number;
  created_at: string;
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export const useRoom = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);

  // Create a new room
  const createRoom = async (config: {
    name: string;
    language: string;
    difficulty: string;
    maxPlayers: number;
    isPrivate: boolean;
  }) => {
    setLoading(true);
    try {
      // Generate room code
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Get random code snippet for the language and difficulty
      const { data: codeSnippets } = await supabase
        .from('code_snippets')
        .select('*')
        .eq('language', config.language)
        .eq('difficulty', config.difficulty)
        .eq('is_active', true);

      if (!codeSnippets || codeSnippets.length === 0) {
        throw new Error('Nenhum código encontrado para esta linguagem e dificuldade');
      }

      const randomSnippet = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];

      // Create room
      const { data: room, error } = await supabase
        .from('rooms')
        .insert({
          room_code: roomCode,
          name: config.name || `Sala ${roomCode}`,
          language: config.language,
          max_players: config.maxPlayers,
          created_by: user?.id,
          code_snippet: randomSnippet.content,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentRoom(room);
      return room;
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Erro ao criar sala",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Join room by code
  const joinRoom = async (roomCode: string, guestName?: string) => {
    setLoading(true);
    try {
      // Find room by code
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .single();

      if (roomError || !room) {
        throw new Error('Sala não encontrada');
      }

      if (room.status === 'finished') {
        throw new Error('Esta sala já foi finalizada');
      }

      // Check if room is full
      const { data: existingParticipants } = await supabase
        .from('race_participants')
        .select('id')
        .eq('room_id', room.id);

      if (existingParticipants && existingParticipants.length >= room.max_players) {
        throw new Error('Sala está lotada');
      }

      // Check if user is already in the room
      let participantExists = false;
      if (user) {
        const { data: existingUserParticipant } = await supabase
          .from('race_participants')
          .select('id')
          .eq('room_id', room.id)
          .eq('user_id', user.id);
        
        participantExists = existingUserParticipant && existingUserParticipant.length > 0;
      }

      // Add participant if not already in room
      if (!participantExists) {
        const { error: participantError } = await supabase
          .from('race_participants')
          .insert({
            room_id: room.id,
            user_id: user?.id,
            guest_name: !user ? guestName : null,
            progress: 0,
            wpm: 0,
            accuracy: 0
          });

        if (participantError) throw participantError;
      }

      setCurrentRoom(room);
      return room;
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: "Erro ao entrar na sala",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Load room data
  const loadRoom = async (roomId: string) => {
    try {
      const { data: room, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) throw error;
      setCurrentRoom(room);
      return room;
    } catch (error) {
      console.error('Error loading room:', error);
      return null;
    }
  };

  // Update participant progress
  const updateProgress = async (roomId: string, progress: number, wpm: number, accuracy: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('race_participants')
        .update({
          progress,
          wpm,
          accuracy,
          ...(progress === 100 ? { finished_at: new Date().toISOString() } : {})
        })
        .eq('room_id', roomId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Subscribe to room participants
  const subscribeToParticipants = (roomId: string) => {
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'race_participants',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          console.log('Participant update:', payload);
          loadParticipants(roomId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Load participants
  const loadParticipants = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('race_participants')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  // Start race
  const startRace = async (roomId: string) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          status: 'racing',
          started_at: new Date().toISOString()
        })
        .eq('id', roomId);

      if (error) throw error;
    } catch (error) {
      console.error('Error starting race:', error);
      toast({
        title: "Erro ao iniciar corrida",
        description: "Não foi possível iniciar a corrida",
        variant: "destructive"
      });
    }
  };

  return {
    loading,
    currentRoom,
    participants,
    createRoom,
    joinRoom,
    loadRoom,
    updateProgress,
    subscribeToParticipants,
    loadParticipants,
    startRace
  };
};