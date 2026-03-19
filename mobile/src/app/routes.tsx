import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { LoginPage } from './pages/LoginPage';
import { AgentDashboard } from './pages/agent/AgentDashboard';
import { ClientsList } from './pages/agent/ClientsList';
import { AddClient } from './pages/agent/AddClient';
import { ProductsList } from './pages/agent/ProductsList';
import { CreateOrder } from './pages/agent/CreateOrder';
import { OrderHistory } from './pages/agent/OrderHistory';
import { OrderDetail } from './pages/agent/OrderDetail';
import { AgentSalesByDate } from './pages/agent/AgentSalesByDate';
import { AgentPaymentIn } from './pages/agent/AgentPaymentIn';
import { DeliveryOrders } from './pages/delivery/DeliveryOrders';
import { DeliveryOrderDetail } from './pages/delivery/DeliveryOrderDetail';
import { DeliveryMap } from './pages/delivery/DeliveryMap';
import { DeliveryProfile } from './pages/delivery/DeliveryProfile';
import { DeliveryDashboard } from './pages/delivery/DeliveryDashboard';

const Root = () => (
  <div style={{ fontFamily: 'Inter, sans-serif' }}>
    <Outlet />
  </div>
);

const IndexRedirect = () => <Navigate to="/login" replace />;

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: IndexRedirect },
      { path: 'login', Component: LoginPage },
      { path: 'agent', Component: AgentDashboard },
      { path: 'agent/clients', Component: ClientsList },
      { path: 'agent/clients/add', Component: AddClient },
      { path: 'agent/products', Component: ProductsList },
      { path: 'agent/orders', Component: OrderHistory },
      { path: 'agent/orders/create', Component: CreateOrder },
      { path: 'agent/orders/:id', Component: OrderDetail },
      { path: 'agent/sales', Component: AgentSalesByDate },
      { path: 'agent/payments/in', Component: AgentPaymentIn },
      { path: 'delivery', Component: DeliveryDashboard },
      { path: 'delivery/orders', Component: DeliveryOrders },
      { path: 'delivery/profile', Component: DeliveryProfile },
      { path: 'delivery/:id', Component: DeliveryOrderDetail },
      { path: 'delivery/:id/map', Component: DeliveryMap },
    ],
  },
]);
