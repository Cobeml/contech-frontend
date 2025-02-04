'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { processNaturalLanguageQuery } from '@/lib/query/llm-client';
import { Loader2, MessageSquare, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  buildingNumber: string;
}

export function ChatSidebar({
  isOpen,
  onClose,
  onToggle,
  buildingNumber,
}: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === ' ' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onToggle();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onToggle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    const assistantMessage = {
      role: 'assistant' as const,
      content: '',
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input, buildingNumber }),
      });

      if (!response.ok || !response.body) throw new Error('Stream error');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content += chunk;
          }
          return newMessages;
        });
      }

      // Remove streaming flag when done
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.isStreaming = false;
        }
        return newMessages;
      });
    } catch (error) {
      console.error('Failed to get response:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-[400px] border-l bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60 font-['Source_Code_Pro']">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-medium">CO Analysis Chat</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto my-4 space-y-4 text-sm">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}-${message.content.slice(0, 20)}`}
              className={`${
                message.role === 'user'
                  ? 'flex justify-end'
                  : 'flex justify-start'
              }`}
            >
              {message.role === 'user' ? (
                <div className="rounded-md px-3 py-1.5 max-w-[85%] bg-primary text-primary-foreground text-sm">
                  {message.content}
                </div>
              ) : (
                <div className="prose prose-invert w-full prose-p:leading-relaxed prose-pre:bg-muted prose-p:text-sm prose-pre:text-sm font-['Source_Code_Pro']">
                  <ReactMarkdown>{message.content || ' '}</ReactMarkdown>
                  {message.isStreaming && (
                    <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary animate-pulse" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the COs..."
            disabled={isLoading}
            className="border-muted-foreground/20 text-sm"
          />
          <Button type="submit" disabled={isLoading} className="text-sm">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  );
}
