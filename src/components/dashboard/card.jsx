function Card({
  icon,
  title,
  value
}) {
  return (
    <div className="card">

      <i className={icon}></i>

      <h3>{title}</h3>

      <p>{value}</p>

    </div>
  );
}

export default Card;