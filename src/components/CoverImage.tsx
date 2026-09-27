export const CoverImage = ({ src, alt, className = '' }: { src?: string; alt: string; className?: string }) => (
  <div className={`cover-frame ${className}`.trim()}>
    <div className="cover-shadow" />
    {src ? <img className="cover" src={src} alt={alt} /> : <div className="cover cover-fallback" role="img" aria-label={`${alt} artwork unavailable`}>ARC</div>}
  </div>
);
