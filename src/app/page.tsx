import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

export default function Home() {
  return (
    <MediaPlayer
      title="Sprite Fight"
      src="https://customer-zctsfptzopsskavs.cloudflarestream.com/e09ee2d4a8de4d34a2c840eb409883e6/manifest/video.m3u8"
    >
      <MediaProvider />
      <DefaultVideoLayout
        thumbnails="https://image.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/storyboard.vtt"
        icons={defaultLayoutIcons}
      />
    </MediaPlayer>
  );
}
