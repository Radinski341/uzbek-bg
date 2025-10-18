type Props = { data: any };
export default function TwoImagePromoBanner({ data }: Props) {
  const { leftImage, rightImage, headline, subline, badge } = data || {};
  return (
    <div data-template="two-image-promo" className="tpl full">
      <div className="grid">
        {leftImage && <img className="cell" src={leftImage} alt="left" />}
        {rightImage && <img className="cell" src={rightImage} alt="right" />}
      </div>
      <div className="center">
        {badge && <div className="badge">{badge}</div>}
        {headline && <h1 className="headline">{headline}</h1>}
        {subline && <div className="subline">{subline}</div>}
      </div>
    </div>
  );
}
