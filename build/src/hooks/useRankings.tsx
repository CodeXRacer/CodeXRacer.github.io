import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RankingPlayer {
  name: string;
  avatar?: string;
  language: string;
  time: string;
  wpm: number;
}

export function useRankings() {
  const [rankings, setRankings] = useState<{
    week: RankingPlayer[];
    month: RankingPlayer[];
    allTime: RankingPlayer[];
  }>({
    week: [],
    month: [],
    allTime: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      setLoading(true);
      
      // Get results from the last week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      // Get results from the last month
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      // Get weekly rankings
      const { data: weekData } = await supabase
        .from('race_results')
        .select(`
          wpm,
          language,
          time_taken,
          guest_name,
          profiles(display_name, avatar_url)
        `)
        .gte('created_at', weekAgo.toISOString())
        .order('wpm', { ascending: false })
        .limit(5);

      // Get monthly rankings
      const { data: monthData } = await supabase
        .from('race_results')
        .select(`
          wpm,
          language,
          time_taken,
          guest_name,
          profiles(display_name, avatar_url)
        `)
        .gte('created_at', monthAgo.toISOString())
        .order('wpm', { ascending: false })
        .limit(5);

      // Get all-time rankings
      const { data: allTimeData } = await supabase
        .from('race_results')
        .select(`
          wpm,
          language,
          time_taken,
          guest_name,
          profiles(display_name, avatar_url)
        `)
        .order('wpm', { ascending: false })
        .limit(5);

      const formatResults = (data: any[]): RankingPlayer[] => {
        return data?.map(result => ({
          name: result.profiles?.display_name || result.guest_name || 'Anônimo',
          avatar: result.profiles?.avatar_url || '',
          language: result.language,
          time: formatTime(result.time_taken),
          wpm: Math.round(result.wpm)
        })) || [];
      };

      setRankings({
        week: formatResults(weekData || []),
        month: formatResults(monthData || []),
        allTime: formatResults(allTimeData || [])
      });
    } catch (error) {
      console.error('Error loading rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (interval: string) => {
    // Convert PostgreSQL interval to seconds and format as MM:SS
    const match = interval.match(/(\d+):(\d+):(\d+)/);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const seconds = parseInt(match[3]);
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, '0')}`;
    }
    return '0:00';
  };

  return { rankings, loading, refetch: loadRankings };
}