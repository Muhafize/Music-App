import Topbar from "@/components/Topbar";
import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect, useState } from "react";
import FeaturedSection from "./components/FeaturedSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import SectionGrid from "./components/SectionGrid";
import { usePlayerStore } from "@/stores/usePlayerStore";

const HomePage = () => {
    const {
        fetchFeaturedSongs,
        fetchMadeForYouSongs,
        fetchTrendingSongs,
        isLoading,
        madeForYouSongs,
        featuredSongs,
        trendingSongs,
    } = useMusicStore();

    const { initializeQueue } = usePlayerStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterBy, setFilterBy] = useState("all");
    const [filteredSongs, setFilteredSongs] = useState([]);

    useEffect(() => {
        fetchFeaturedSongs();
        fetchMadeForYouSongs();
        fetchTrendingSongs();
    }, [fetchFeaturedSongs, fetchMadeForYouSongs, fetchTrendingSongs]);

    useEffect(() => {
        if (madeForYouSongs.length > 0 && featuredSongs.length > 0 && trendingSongs.length > 0) {
            const allSongs = [...featuredSongs, ...madeForYouSongs, ...trendingSongs];
            initializeQueue(allSongs);
            setFilteredSongs(allSongs);
        }
    }, [initializeQueue, madeForYouSongs, trendingSongs, featuredSongs]);

    useEffect(() => {
        const allSongs = [...featuredSongs, ...madeForYouSongs, ...trendingSongs];
        let filtered = allSongs;

        if (searchQuery) {
            filtered = filtered.filter(song =>
                song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                song.albumId?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filterBy !== "all") {
            filtered = filtered.filter(song => song[filterBy]?.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        console.log("Filtered Songs:", filtered);
        setFilteredSongs(filtered);
    }, [searchQuery, filterBy, featuredSongs, madeForYouSongs, trendingSongs]);

    console.log("Search Query:", searchQuery);
    console.log("Filter By:", filterBy);
    console.log("Made For You Songs:", madeForYouSongs);
    console.log("Trending Songs:", trendingSongs);

    return (
        <main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
            <Topbar />
            <ScrollArea className="h-[calc(100vh-180px)]">
                <div className='p-4 sm:p-6'>
                    <h1 className='text-2xl sm:text-3xl font-bold mb-6'>Good afternoon</h1>

                    <div className="flex gap-4 mb-6">
                        <input
                            type="text"
                            placeholder="Search by song, artist, or album"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="p-2 rounded-md bg-zinc-700 text-white"
                        />
                        <select
                            value={filterBy}
                            onChange={(e) => setFilterBy(e.target.value)}
                            className="p-2 rounded-md bg-zinc-700 text-white"
                        >
                            <option value="all">All</option>
                            <option value="title">Song</option>
                            <option value="artist">Artist</option>
                            <option value="album">Album</option>
                        </select>
                    </div>

                    <FeaturedSection />

                    <div className='space-y-8'>
                        <SectionGrid title='Made For You' songs={filteredSongs} isLoading={isLoading} />
                        <SectionGrid title='Trending' songs={filteredSongs} isLoading={isLoading} />
                    </div>
                </div>
            </ScrollArea>
        </main>
    );
};

export default HomePage;