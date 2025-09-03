-- Insert some sample code snippets for testing
INSERT INTO public.code_snippets (language, difficulty, title, content, category) VALUES
-- JavaScript snippets
('javascript', 'easy', 'Hello World', 'console.log("Hello, World!");', 'general'),
('javascript', 'medium', 'Array Sum', 'function sum(arr) {\n  return arr.reduce((a, b) => a + b, 0);\n}\n\nconsole.log(sum([1, 2, 3, 4, 5]));', 'arrays'),
('javascript', 'hard', 'Fibonacci Sequence', 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n-1) + fibonacci(n-2);\n}\n\nfor (let i = 0; i < 10; i++) {\n  console.log(`F(${i}) = ${fibonacci(i)}`);\n}', 'algorithms'),

-- Python snippets
('python', 'easy', 'Hello World', 'print("Hello, World!")', 'general'),
('python', 'medium', 'List Comprehension', 'numbers = [1, 2, 3, 4, 5]\nsquares = [x**2 for x in numbers if x % 2 == 0]\nprint(squares)', 'lists'),
('python', 'hard', 'Binary Search', 'def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    \n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    \n    return -1\n\nprint(binary_search([1, 3, 5, 7, 9], 5))', 'algorithms'),

-- Java snippets
('java', 'easy', 'Hello World', 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}', 'general'),
('java', 'medium', 'Simple Calculator', 'public class Calculator {\n    public static int add(int a, int b) {\n        return a + b;\n    }\n    \n    public static void main(String[] args) {\n        int result = add(5, 3);\n        System.out.println("Result: " + result);\n    }\n}', 'math'),
('java', 'hard', 'Bubble Sort', 'public class BubbleSort {\n    public static void bubbleSort(int[] arr) {\n        int n = arr.length;\n        for (int i = 0; i < n-1; i++) {\n            for (int j = 0; j < n-i-1; j++) {\n                if (arr[j] > arr[j+1]) {\n                    int temp = arr[j];\n                    arr[j] = arr[j+1];\n                    arr[j+1] = temp;\n                }\n            }\n        }\n    }\n    \n    public static void main(String[] args) {\n        int[] arr = {64, 34, 25, 12, 22, 11, 90};\n        bubbleSort(arr);\n        for (int value : arr) {\n            System.out.print(value + " ");\n        }\n    }\n}', 'algorithms');