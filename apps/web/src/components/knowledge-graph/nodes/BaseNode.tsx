'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Button } from '@repo/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { MouseEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { Handle, type NodeProps, Position } from 'reactflow';

const nodeColors = {
  concept: 'bg-blue-100 dark:bg-blue-900',
  material: 'bg-green-100 dark:bg-green-900',
  technique: 'bg-purple-100 dark:bg-purple-900',
  regulation: 'bg-orange-100 dark:bg-orange-900',
};

interface NodeData {
  label: string;
  details: string;
  category: string;
  expandable: boolean;
  link?: string;
  summary?: string | null;
}

export function BaseNode({ data, type }: NodeProps<NodeData>) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  const handleShowSummary = async (e: MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    setShowPopover(true);
    // Brief delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
  };

  const handleNodeClick = () => {
    if (data.link) {
      window.open(data.link, '_blank');
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleNodeClick();
    }
  };

  return (
    <div className="relative group">
      <button
        type="button"
        className={cn(
          'px-4 py-2 shadow-lg rounded-lg border bg-card w-full text-left',
          data.link && 'cursor-pointer hover:bg-accent',
        )}
        onClick={handleNodeClick}
        onKeyDown={handleKeyDown}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-muted-foreground"
        />
        <Card
          className={cn(
            'min-w-[200px] transition-all duration-200',
            'hover:shadow-lg hover:scale-105',
            data.summary
              ? nodeColors[type as keyof typeof nodeColors]
              : 'bg-gray-100 dark:bg-gray-800',
          )}
        >
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">{data.label}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 text-xs">{data.details}</CardContent>
        </Card>
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-muted-foreground"
        />
      </button>

      {data.link && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Popover open={showPopover} onOpenChange={setShowPopover}>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="shadow-lg"
                onClick={handleShowSummary}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'View Summary'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[500px] p-4 shadow-lg backdrop-blur-sm bg-card/95">
              <ScrollArea className="h-[400px] w-full pr-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : data.summary ? (
                  <div className="animate-in fade-in duration-500">
                    <ReactMarkdown className="prose prose-sm dark:prose-invert prose-headings:text-base prose-p:text-sm prose-ul:text-sm">
                      {data.summary}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    No summary available
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
