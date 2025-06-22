import "./JobDetail.scss";

type Job = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  requirements: string[];
  tasks: string[];
  offer: string[];
};

type Props = {
  job: Job;
};

export default function JobDetails({ job }: Props) {
  return (
    <div className="job-details-container">
      <div className="left">
        <h1>{job.name}</h1>
        <p className="intro">{job.description}</p>
        {job.imageUrl && (
          <img src={job.imageUrl} alt={job.name} className="job-image" />
        )}
      </div>

      <div className="right">
        <h2>MEHR INFOS</h2>

        <section>
          <h3>Anforderungen</h3>
          <ul>
            {job.requirements.map((req, i) => (
              <li key={i}>- {req}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3>dann erwarten Dich bei uns folgende Aufgaben</h3>
          <ul>
            {job.tasks.map((task, i) => (
              <li key={i}>- {task}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Wir bieten</h3>
          <ul>
            {job.offer.map((item, i) => (
              <li key={i}>- {item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
