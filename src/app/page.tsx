import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

export default function Home() {
  return (
    <MediaPlayer
      title="Sprite Fight"
      src="https://customer-zctsfptzopsskavs.cloudflarestream.com/fa8bc576a080afbb9aab11f1329448fb/manifest/video.m3u8"
    >
      <MediaProvider />
      <DefaultVideoLayout
        thumbnails="https://image.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/storyboard.vtt"
        icons={defaultLayoutIcons}
      />
    </MediaPlayer>
  );
}
