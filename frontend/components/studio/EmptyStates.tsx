import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ImageIcon,
  Sparkles,
  FolderOpen,
  AlertCircle,
  Wifi,
  RefreshCw,
} from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="mb-4 text-neutral-400">
        {icon || <ImageIcon className="w-16 h-16" />}
      </div>
      <h3 className="text-xl font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-600 max-w-md mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="gap-2">
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}

export function NoCreationsEmpty({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <EmptyState
      icon={<FolderOpen className="w-16 h-16" />}
      title="No creations yet"
      description="You haven't generated any images yet. Start creating amazing AI-generated images now!"
      action={{
        label: 'Create Your First Image',
        onClick: onCreateClick,
      }}
    />
  );
}

export function NoTemplatesEmpty({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <EmptyState
      icon={<Sparkles className="w-16 h-16" />}
      title="No templates available"
      description="There are no templates available at the moment. Please check back later or contact support."
      action={onRefresh ? {
        label: 'Refresh',
        onClick: onRefresh,
      } : undefined}
    />
  );
}

export function ErrorState({ 
  title = 'Something went wrong',
  description = 'An error occurred while loading this content. Please try again.',
  onRetry,
}: { 
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={<AlertCircle className="w-16 h-16 text-red-500" />}
      title={title}
      description={description}
      action={onRetry ? {
        label: 'Try Again',
        onClick: onRetry,
      } : undefined}
    />
  );
}

export function OfflineState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={<Wifi className="w-16 h-16 text-orange-500" />}
      title="No internet connection"
      description="Please check your internet connection and try again."
      action={onRetry ? {
        label: 'Retry',
        onClick: onRetry,
      } : undefined}
    />
  );
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="text-neutral-600">{message}</p>
    </motion.div>
  );
}

