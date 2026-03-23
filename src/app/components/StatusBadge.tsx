import { OrderStatus } from '../data/mockData';
import { useApp } from '../context/AppContext';

interface StatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { bg: string; text: string; dot: string }> = {
  new: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  tayyorlanmagan: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  yuborilgan: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' },
  accepted: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500' },
  delivering: { bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
  delivered: { bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
  cancelled: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
  sent: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
};

const statusLabelKeys: Record<OrderStatus, string> = {
  new: 'status.new',
  tayyorlanmagan: 'status.tayyorlanmagan',
  yuborilgan: 'status.yuborilgan',
  accepted: 'status.accepted',
  delivering: 'status.delivering',
  delivered: 'status.delivered',
  cancelled: 'status.cancelled',
  sent: 'status.tayyorlanmagan', // sent = agent yuborgan, Tayyorlanmagan bilan bir xil
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { t } = useApp();
  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {t(statusLabelKeys[status] as any)}
    </span>
  );
};
