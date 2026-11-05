export function PlateFace({
  src,
  position,
  title,
  text,
}: {
  src: string;
  position: string;
  title?: readonly string[];
  text?: string;
}) {
  return (
    <div className={`face${title ? " face-titled" : ""}`}>
      <img src={src} alt="" style={{ objectPosition: position }} />
      {title ? (
        <div className="plate-copy">
          <h3>
            {title.map((line, index) => (
              <span key={`${line}-${index}`}>
                {index > 0 && <br />}
                {line}
              </span>
            ))}
          </h3>
          {text ? <p>{text}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
