import { currentUser } from '@/lib/auth';
import React from 'react';
import { LogOut } from 'lucide-react';
import logout from '@/actions/logout';
import { Button } from './button';

const TopHeader = async ({ title, showLogout }: { title?: string, showLogout?: boolean }) => {
    const user = await currentUser();
    return (
        <header className="flex bg-gray-700 text-white h-18 items-center">
            <div className="container  px-2 py-3">
                <h1 className="text-lg font-semibold">{title || (user?.role === 'ADMIN' ? 'CDR Viewer Admin Console' : 'CDR Viewer')}</h1>
            </div>
            {
                showLogout &&
                <Button className='ml-auto mr-10 cursor-pointer' variant="ghost" onClick={logout}>
                    <LogOut />
                </Button>
            }
        </header>
    );
};

export default TopHeader;