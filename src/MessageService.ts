// import { Observable } from "rxjs";
import { Subject, Observable } from "rxjs";
import { map, filter } from "rxjs/operators";

interface EventData {
  key: string;
  data: any;
}
// const subject = new Subject<EventData>();

const subject = new Subject();
export const MessageService = {
  on: (key: any) => {
    const message = subject.pipe(filter((event: any) => event.key === key));
    return message.pipe(map((event) => event.data));
  },
  dispatchEvent: (key: any, data: any) => {
    subject.next({ key, data });
  },
  unsubscribeEvent: (event: any) => {
    if (event) {
      event.unsubscribe();
      console.log("unsubscrbing" + event);
    }
  },
};