import { OrderStatus } from '../data/mockData';
import { useApp } from '../context/AppContext';

interface StatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { bg: string; text: string; dot: string }> = {
  new: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  tayyorlanmagan: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  yuborilgan: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  accepted: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  delivering: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  delivered: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  // eski status: sent = agent yuborgan (tayyorlanmagan bilan bir xil)
  sent: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
};

const statusLabelKeys: Record<OrderStatus, string> = {
  new: 'status.new',
  tayyorlanmagan: 'status.tayyorlanmagan',
  yuborilgan: 'status.yuborilgan',
  accepted: 'status.accepted',
  delivering: 'status.delivering',
  delivered: 'status.delivered',
  cancelled: 'status.cancelled',
  sent: 'status.tayyorlanmagan',
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
