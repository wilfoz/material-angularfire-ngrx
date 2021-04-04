import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { TrainingService } from '../training.service';
import { Exercise } from '../exercise.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit {
  exercises!: Exercise[];
  exercisesSubscription!: Subscription;

  constructor(
    private trainingService: TrainingService,
  ) { }

  ngOnInit() {
    this.exercisesSubscription = this.trainingService.exercisesChanged.subscribe({
      next: (exercises) => this.exercises = exercises
    });
    this.trainingService.fetchGetAvailableExercises();
  }

  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exercise);
  }

  ngOnDestroy(): void {
    this.exercisesSubscription.unsubscribe();

  }

}
