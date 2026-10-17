export default function PageTitle({ icon, children, actions }) {
  return (
    <section className="page-title">
      <div className="row justify-content-between align-items-center">
        <div className="col-md-6">
          <h1 className="page-title">
            {icon ? <i className={`${icon} mr-2`} /> : null}
            {children}
          </h1>
        </div>
        {actions ? <div className="col-md-6 text-md-right">{actions}</div> : null}
      </div>
    </section>
  );
}
