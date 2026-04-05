export function AudioPlayer({ src, title }) {
  return (
    <div className="audio-player">
      {title && <h3 className="audio-player-title">{title}</h3>}
      <audio className="audio-player-element" src={src} controls preload="metadata">
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
