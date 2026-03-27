import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { LoginPage } from './pages/LoginPage';
import { AgentDashboard } from './pages/agent/AgentDashboard';
import { ClientsList } from './pages/agent/ClientsList';
import { AddClient } from './pages/agent/AddClient';
import { ProductsList } from './pages/agent/ProductsList';
import { CreateOrder } from './pages/agent/CreateOrder';
import { OrderHistory } from './pages/agent/OrderHistory';
import { OrderDetail } from './pages/agent/OrderDetail';
import { DeliveryOrders } from './pages/delivery/DeliveryOrders';
import { DeliveryOrderDetail } from './pages/delivery/DeliveryOrderDetail';
import { DeliveryMap } from './pages/delivery/DeliveryMap';
import { DeliveryProfile } from './pages/delivery/DeliveryProfile';
import { DeliveryDashboard } from './pages/delivery/DeliveryDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AgentStats } from './pages/admin/AgentStats';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminClients } from './pages/admin/AdminClients';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminAgents } from './pages/admin/AdminAgents';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminWarehouse } from './pages/admin/AdminWarehouse';
import { AdminSuppliers } from './pages/admin/AdminSuppliers';
import { AdminSupplierProfile } from './pages/admin/AdminSupplierProfile';
import { AdminProfile } from './pages/admin/AdminProfile';
import { AdminSkladCash } from './pages/admin/AdminSkladCash';
import { AdminCashbox } from './pages/admin/AdminCashbox';

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

      // Agent routes
      { path: 'agent', Component: AgentDashboard },
      { path: 'agent/clients', Component: ClientsList },
      { path: 'agent/clients/add', Component: AddClient },
      { path: 'agent/products', Component: ProductsList },
      { path: 'agent/orders', Component: OrderHistory },
      { path: 'agent/orders/create', Component: CreateOrder },
      { path: 'agent/orders/:id', Component: OrderDetail },

      // Delivery routes
      { path: 'delivery', Component: DeliveryDashboard },
      { path: 'delivery/orders', Component: DeliveryOrders },
      { path: 'delivery/profile', Component: DeliveryProfile },
      { path: 'delivery/:id', Component: DeliveryOrderDetail },
      { path: 'delivery/:id/map', Component: DeliveryMap },

      // Admin routes
      { path: 'admin', Component: AdminDashboard },
      { path: 'admin/agents', Component: AgentStats },
      { path: 'admin/orders', Component: AdminOrders },
      { path: 'admin/clients', Component: AdminClients },
      { path: 'admin/products', Component: AdminProducts },
      { path: 'admin/suppliers', Component: AdminSuppliers },
      { path: 'admin/suppliers/:id', Component: AdminSupplierProfile },
      { path: 'admin/agents-mgmt', Component: AdminAgents },
      { path: 'admin/reports', Component: AdminReports },
      { path: 'admin/warehouse', Component: AdminWarehouse },
      { path: 'admin/cash-sklad', Component: AdminSkladCash },
      { path: 'admin/cash-admin', Component: AdminCashbox },
      { path: 'admin/profile', Component: AdminProfile },
    ],
  },
]);