import { Component, HostListener, computed, input, signal } from '@angular/core';
import { Project } from './models';

@Component({
  selector: 'app-projects',
  standalone: true,
  template: `
    <div class="filters" role="tablist" aria-label="Project categories">
      @for (c of categories(); track c) {
        <button class="chip" [class.active]="filter() === c" (click)="filter.set(c)">{{ c }}</button>
      }
    </div>

    <div class="grid">
      @for (p of visible(); track p.id) {
        <article class="card project" tabindex="0" (click)="selected.set(p)" (keydown.enter)="selected.set(p)">
          <div class="meta"><span class="mono">{{ p.category }}</span><span>{{ p.period }}</span></div>
          <h3>{{ p.title }}</h3>
          <p class="sub">{{ p.subtitle }}</p>
          <p>{{ p.summary }}</p>
          <ul class="tags">
            @for (t of p.stack.slice(0, 6); track t) { <li>{{ t }}</li> }
          </ul>
          <span class="more">Read case study →</span>
        </article>
      }
    </div>

    @if (selected(); as p) {
      <div class="backdrop" (click)="selected.set(null)">
        <section class="modal card" role="dialog" aria-modal="true" [attr.aria-label]="p.title" (click)="$event.stopPropagation()">
          <button class="close" (click)="selected.set(null)" aria-label="Close">×</button>
          <div class="meta"><span class="mono">{{ p.category }}</span><span>{{ p.period }}</span></div>
          <h3>{{ p.title }}</h3>
          <p class="sub">{{ p.subtitle }}</p>
          <h4>Problem</h4>
          <p>{{ p.problem }}</p>
          <h4>What I built</h4>
          <ul class="bullets">
            @for (h of p.highlights; track h) { <li>{{ h }}</li> }
          </ul>
          <h4>Tech stack</h4>
          <ul class="tags">
            @for (t of p.stack; track t) { <li>{{ t }}</li> }
          </ul>
          <div class="actions">
            @if (p.repoUrl) { <a class="btn" [href]="p.repoUrl" target="_blank" rel="noopener">View source on GitHub</a> }
            @if (p.liveUrl) { <a class="btn ghost" [href]="p.liveUrl" target="_blank" rel="noopener">Live demo</a> }
          </div>
        </section>
      </div>
    }
  `
})
export class ProjectsComponent {
  projects = input.required<Project[]>();
  filter = signal('All');
  selected = signal<Project | null>(null);

  categories = computed(() => ['All', ...new Set(this.projects().map(p => p.category))]);
  visible = computed(() => this.projects().filter(p => this.filter() === 'All' || p.category === this.filter()));

  @HostListener('document:keydown.escape') close() { this.selected.set(null); }
}
