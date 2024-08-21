import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LevelsComponent} from './components/levels/levels.component';
import { AppComponent } from './app.component';
import { LeadboardComponent } from './components/leadboard/leadboard.component';
import { LevelResultsComponent } from './components/level-results/level-results.component';
import { LevelSelectorComponent } from './components/level-selector/level-selector.component';
import { MenuComponent } from './components/menu/menu.component';
import { LoginComponent } from './components/login/login.component';
import { StoryComponent } from './components/story/story.component';
import { FinalLvComponent } from './components/final-lv/final-lv.component';
import { CreditsComponent } from './components/credits/credits.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { TutorialComponent } from './components/tutorial/tutorial.component';
import { CharactersComponent } from './components/characters/characters.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {path:'level/:id',component:LevelsComponent},
  {path:'leadboard',component:LeadboardComponent},
  {path:'results/:id',component:LevelResultsComponent},
  {path:'story/:id',component:StoryComponent},
  {path:'menu',component:MenuComponent},
  {path:'selector',component:LevelSelectorComponent},
  {path: 'login', component:LoginComponent},
  {path: 'finalLevel',component:FinalLvComponent},
  {path: 'credits/:id', component:CreditsComponent},
  {path: 'tutorial', component: TutorialComponent},
  {path: 'characters', component: CharactersComponent}


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
