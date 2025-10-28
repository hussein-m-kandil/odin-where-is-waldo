import { environment } from '../environments/environment';
import { Routes } from '@angular/router';
import { Game } from './game/game';

const { title } = environment;

export const routes: Routes = [{ path: '', title, component: Game }];
