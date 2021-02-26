// @flow
import { Lbryio } from 'lbryinc';
import parser from 'fast-xml-parser';

export function ytsync() {
  const baseURL = 'https://www.youtube.com/feeds/videos.xml?channel_id=';

  Lbryio.call('yt', 'next_channel')
    .then((data) => {
      const channel = data.channel_id;
      const lastVideoID = data.last_video_id;

      fetch(baseURL + channel).then((res) => {
        const xml = parser.parse(res.text());

        const latestVideo = xml.feed.entry[0];
        if (lastVideoID !== latestVideo['yt:videoId']) {
          console.log(channel + ': new video', lastVideoID, latestVideo['yt:videoId']);
          Lbryio.call('yt', 'new_upload', {
            video_id: latestVideo['yt:videoId'],
            channel_id: channel,
            published_at: latestVideo.published,
          });
        } else {
          console.log(channel + ': no new videos', lastVideoID, latestVideo);
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
}
