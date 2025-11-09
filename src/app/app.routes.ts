import { Routes } from '@angular/router';
import { Main } from './main/main';
import { Camera } from './camera/camera';

export const routes: Routes = [
    {
        path: '',
        component: Main
    },{
        path: 'camera',
        component: Camera
    }
];
