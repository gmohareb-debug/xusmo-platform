export function VideoPlayer({ src, poster, title }) {
  return (
    <div className="video-player">
      {title && <h3 className="video-player-title">{title}</h3>}
      <div className="video-player-wrap">
        <video
          className="video-player-element"
          src={src}
          poster={poster}
          controls
          preload="metadata"
        >
          Your browser does not support the video element.
        </video>
      </div>
    </div>
  );
}
