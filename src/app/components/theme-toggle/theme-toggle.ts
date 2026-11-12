import { Component, computed, inject } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';
import { Icon } from '../icon/icon';

/** Switches between the light and dark themes. */
@Component({
  imports: [Icon],
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss',
})
export class ThemeToggle {
  private readonly themeService = inject(ThemeService);

  protected readonly isDark = computed(() => this.themeService.theme() === 'dark');
  protected readonly lightLabel = 'Thème clair';
  protected readonly darkLabel = 'Thème sombre';

  protected toggleTheme(): void {
    this.themeService.toggle();
  }
}
