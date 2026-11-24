import {conferenceDays, useScheduleStore} from '../store/useScheduleStore';

export function DayPicker(){
  const {day,setDay}=useScheduleStore();
  return <div className="day-picker" role="group" aria-label="Conference days in May 2027">
    {conferenceDays.map(d=><button key={d} aria-pressed={d===day} onClick={()=>setDay(d)}>{d}</button>)}
  </div>;
}
