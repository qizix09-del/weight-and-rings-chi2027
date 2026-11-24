import type { Session } from '../data/programme';

export function YearRecord({session, year, includePreview=true}: {
  session: Session; year: number; includePreview?: boolean; compact?: boolean;
}) {
  const works = session.priorWorks.filter(work => work.year === year);
  return <>
    <section className="record-card" aria-label={'CHI records for '+year} key={year}>
      {works.length ? works.map(work => <article key={work.url}>
        <p className="record-year">{work.year} · {work.venue}</p>
        <h2>{work.title}</h2>
        
        <p className="takeaway">{work.takeaway}</p>
        <div className="record-links">
          <a href={work.url} target="_blank" rel="noreferrer" className="publication-link" aria-label={'View publication: '+work.title+' (opens in a new tab)'}>View publication ↗</a>
          {<details className="record-authors">
            <summary>Authors ({work.authors.length})</summary><p className="authors">{work.authors.join(', ')}</p>
          </details>}
        </div>
      </article>) : <>
        <p className="record-year">{year===2027 ? '2027 · Demo session' : year+' · CHI'}</p>
        {year===2027 && includePreview && <p className="takeaway">{session.abstract15s}</p>}
        <p className="no-record">No linked CHI record in this year</p>
      </>}
      <p className="room-note">ROOM CAP: {session.roomCapacity??'UNSPECIFIED'} · CHI JSON</p>
    </section>
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{year} · {works.length ? works.map(work=>work.title).join('. ') : 'No linked CHI record in this year'}</div>
  </>;
}
