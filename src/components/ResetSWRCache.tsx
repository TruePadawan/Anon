import { SWRConfig } from "swr";

interface ResetSWRCacheProps {
    children: React.ReactNode;
}

export default function ResetSWRCache({ children }: ResetSWRCacheProps) {
    return (
        <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
    );
}
