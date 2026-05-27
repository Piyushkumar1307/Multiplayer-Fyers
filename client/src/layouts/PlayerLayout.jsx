import { Outlet } from 'react-router-dom';

export default function PlayerLayout() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-black text-white max-w-lg mx-auto w-full lg:max-w-2xl">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
