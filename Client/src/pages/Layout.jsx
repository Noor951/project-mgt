import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadTheme } from '../features/themeSlice'
import { Loader2Icon } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { setCurrentWorkspace, setWorkspaces } from '../features/workspaceSlice'

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isBootstrapping, setIsBootstrapping] = useState(true)
    const { loading } = useSelector((state) => state.workspace)
    const dispatch = useDispatch()
    const { isLoaded, isSignedIn, user } = useUser()

    useEffect(() => {
        dispatch(loadTheme())
    }, [dispatch])

    useEffect(() => {
        const syncUser = async () => {
            if (!isLoaded) return

            if (!isSignedIn || !user?.id) {
                setIsBootstrapping(false)
                return
            }

            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

            const normalizedUser = {
                id: user.id,
                first_name: user.firstName || user.first_name,
                last_name: user.lastName || user.last_name,
                username: user.username,
                primary_email_address:
                    user.primaryEmailAddress?.emailAddress ||
                    user.primary_email_address ||
                    user.emailAddresses?.[0]?.emailAddress ||
                    user.email,
                email_addresses: user.emailAddresses
                    ? user.emailAddresses.map((e) => ({ email_address: e.emailAddress }))
                    : undefined,
                image_url: user.profileImageUrl || user.imageUrl || user.image_url || "",
            };

            const response = await fetch(`${apiBaseUrl}/api/workspaces/bootstrap`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user: normalizedUser }),
            })

            if (!response.ok) {
                throw new Error('Failed to load workspace')
            }

            const data = await response.json()

            if (data?.workspace) {
                dispatch(setWorkspaces([data.workspace]))
                dispatch(setCurrentWorkspace(data.workspace.id))
            }

            setIsBootstrapping(false)
        }

        syncUser().catch(() => {
            setIsBootstrapping(false)
        })
    }, [dispatch, isLoaded, isSignedIn, user])

    if (loading || isBootstrapping) {
        return (
            <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
                <Loader2Icon className="size-7 text-blue-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col h-screen">
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <div className="flex-1 h-full p-6 xl:p-10 xl:px-16 overflow-y-scroll">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout