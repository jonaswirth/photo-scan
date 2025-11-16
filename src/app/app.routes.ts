import { Routes } from '@angular/router';
import { Main } from './main/main';
import { Camera } from './camera/camera';
import { Processing } from './processing/processing';
import { Test } from './test/test';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
    },
    {
        path: 'main',
        component: Main
    }, {
        path: 'camera',
        component: Camera
    }, {
        path: 'processing',
        component: Processing
    }, {
        path: 'test',
        component: Test
    }
];
