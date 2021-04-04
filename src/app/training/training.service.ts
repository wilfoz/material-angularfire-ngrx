import { AngularFirestore } from '@angular/fire/firestore';
import { Subject, Subscription } from 'rxjs';
import { Exercise } from './exercise.model';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';

@Injectable()
export class TrainingService {

  exerciseChanged = new Subject<Exercise | any>();
  exercisesChanged = new Subject<Exercise[]>();
  finishedExercisesChanged = new Subject<Exercise[]>();

  private availableExercises: Exercise[] = [];
  private runningExercise!: Exercise | any;

  private fbSubs: Subscription[] = [];

  constructor(private db: AngularFirestore) { }

  fetchGetAvailableExercises() {
    this.fbSubs.push(this.db
    .collection('availableExercises')
    .snapshotChanges()
    .pipe(
      map(docArray => {
        return docArray.map(doc => {
          const res: any = doc.payload.doc.data();
          return { id: doc.payload.doc.id, ...res }
        })
      })
    ).subscribe({
      next: (exercises: Exercise[]) => {
        this.availableExercises = exercises;
        this.exercisesChanged.next([...this.availableExercises]);
      }
    }))
  }

  startExercise(selectedId: string) {
    this.runningExercise = this.availableExercises.find(
      ex => ex.id === selectedId
    );
    this.exerciseChanged.next({ ...this.runningExercise });
  }

  completeExercise() {
    this.addDataToDatabase({
      ...this.runningExercise,
      date: new Date(),
      state: 'completed'
    });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  cancelExercise(progress: number) {
    this.addDataToDatabase({
      ...this.runningExercise,
      duration: this.runningExercise.duration * (progress / 100),
      calories: this.runningExercise.calories * (progress / 100),
      date: new Date(),
      state: 'cancelled'
    });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  getRunningExercise() {
    return { ...this.runningExercise };
  }

  fetchGetCompletedOrCancelledExercises() {
    this.fbSubs.push(this.db
      .collection('finishedExercises')
      .valueChanges()
      .subscribe(
        (exercises: any[]) => {
          this.finishedExercisesChanged.next(exercises)
        }
      ));
  }

  cancelSubscriptions() {
    this.fbSubs.forEach(subs => subs.unsubscribe());
  }

  private addDataToDatabase(exercise: Exercise) {
    this.db.collection('finisheExercises').add(exercise);
  }
}
