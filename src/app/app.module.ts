import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LevelsComponent } from './components/levels/levels.component';
import { withFetch } from '@angular/common/http';
import { LeadboardComponent } from './components/leadboard/leadboard.component';
import { LoginComponent } from './components/login/login.component';
import { LevelSelectorComponent } from './components/level-selector/level-selector.component';
import { LevelResultsComponent } from './components/level-results/level-results.component';
import { MenuComponent } from './components/menu/menu.component';
import { FormsModule } from '@angular/forms';
import { StoryComponent } from './components/story/story.component';
import { ImageMagnifierComponent } from './components/image-magnifier/image-magnifier.component';
import { FinalLvComponent } from './components/final-lv/final-lv.component';
import { CreditsComponent } from './components/credits/credits.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { AuthInterceptor } from './auth.interceptor';
import { TutorialComponent } from './components/tutorial/tutorial.component';
import { CharactersComponent } from './components/characters/characters.component';
@NgModule({
  declarations: [
    AppComponent,
    LevelsComponent,
    LeadboardComponent,
    LoginComponent,
    LevelSelectorComponent,
    LevelResultsComponent,
    MenuComponent,
    StoryComponent,
    ImageMagnifierComponent,
    FinalLvComponent,
    CreditsComponent,
    SideMenuComponent,
    TutorialComponent,
    CharactersComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
