import { OrdersTable } from "@/components/orders/orders-table";
import { ordersControllerFindAll } from "@/lib/api/generated";

export default async function Page() {
  const orders = await ordersControllerFindAll();

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          Manage and edit customer orders.
        </p>
      </div>

      <OrdersTable data={orders} />
    </>
  );
}
