import {
    QueryClient,
    QueryClientProvider
} from '@tanstack/react-query'
import type { ReactNode } from 'react'


// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
        },
    },
})


const TanstackProvider = ({ children }: { children: ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

export default TanstackProvider