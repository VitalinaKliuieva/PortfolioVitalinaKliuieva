import { Component, OnInit, inject, signal } from '@angular/core';
import { ContactComponent } from './contact.component';
import { Portfolio } from './models';
import { PortfolioService } from './portfolio.service';
import { ProjectsComponent } from './projects.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ProjectsComponent, ContactComponent],
  template: `
    <header class="nav">
      <a class="logo" href="#top">VK<span>.</span></a>
      <nav>
        <a href="#projects">Projects</a>
        <a href="#experience">Experience</a>
        <a href="#skills">Skills</a>
        <a href="#contact">Contact</a>
        <button class="theme" (click)="toggleTheme()" [attr.aria-label]="'Switch to ' + (theme() === 'dark' ? 'light' : 'dark') + ' theme'">
          {{ theme() === 'dark' ? '☀' : '☾' }}
        </button>
      </nav>
    </header>

    @if (data(); as d) {
      <main id="top">
        <section class="hero">
          <p class="mono eyebrow">{{ d.profile.title }}</p>
          <h1>{{ d.profile.name }}</h1>
          <p class="tagline">{{ d.profile.tagline }}</p>
          <p class="lead">{{ d.profile.summary }}</p>
          <div class="actions">
            <a class="btn" href="#projects">View projects</a>
            <a class="btn ghost" [href]="d.profile.github" target="_blank" rel="noopener">GitHub</a>
            @if (d.profile.linkedin) { <a class="btn ghost" [href]="d.profile.linkedin" target="_blank" rel="noopener">LinkedIn</a> }
          </div>
          <dl class="facts">
            <div><dt>Based in</dt><dd>{{ d.profile.location }}</dd></div>
            <div><dt>Education</dt><dd>{{ d.profile.education }}</dd></div>
            <div><dt>Languages</dt><dd>{{ d.profile.languages.join(' · ') }}</dd></div>
          </dl>
        </section>

        <section id="projects">
          <h2><span class="mono">01</span> Selected projects</h2>
          <app-projects [projects]="d.projects" />
        </section>

        <section id="experience">
          <h2><span class="mono">02</span> Experience</h2>
          <div class="timeline">
            @for (e of d.experience; track e.role) {
              <article class="card">
                <div class="meta"><span class="mono">{{ e.org }}</span><span>{{ e.period }}</span></div>
                <h3>{{ e.role }}</h3>
                <p class="sub">{{ e.description }}</p>
                <ul class="bullets">
                  @for (p of e.points; track p) { <li>{{ p }}</li> }
                </ul>
              </article>
            }
          </div>
        </section>

        <section id="skills">
          <h2><span class="mono">03</span> Skills</h2>
          <div class="grid">
            @for (g of d.skills; track g.name) {
              <article class="card">
                <h3>{{ g.name }}</h3>
                <ul class="tags">
                  @for (i of g.items; track i) { <li>{{ i }}</li> }
                </ul>
              </article>
            }
          </div>
        </section>

        <section id="contact">
          <h2><span class="mono">04</span> Let's talk</h2>
          <p class="lead">I am open to junior software developer and test automation roles. Write to me or reach out at
            <a [href]="'mailto:' + d.profile.email">{{ d.profile.email }}</a>.</p>
          <app-contact />
        </section>
      </main>
      <footer>© {{ year }} {{ d.profile.name }} · Built with Spring Boot and Angular</footer>
    } @else if (error()) {
      <main class="state"><p>The API is not reachable. Start the backend on port 8080.</p></main>
    } @else {
      <main class="state"><p class="mono">Loading…</p></main>
    }
  `
})
export class AppComponent implements OnInit {
  private api = inject(PortfolioService);
  data = signal<Portfolio | null>(null);
  error = signal(false);
  theme = signal<'dark' | 'light'>('dark');
  year = new Date().getFullYear();

  ngOnInit() {
    this.api.load().subscribe({ next: d => this.data.set(d), error: () => this.error.set(true) });
  }

  toggleTheme() {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    document.documentElement.dataset['theme'] = next;
  }
}
