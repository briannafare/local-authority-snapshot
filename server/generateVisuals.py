#!/usr/bin/env python3
"""
Generate branded visualizations for Local Authority Snapshot audits.
Uses eighty5labs brand colors: Orange (#FF6B35) and Teal (#2DD4BF)
"""

import sys
print(f'Python executable: {sys.executable}', file=sys.stderr)
print(f'Python path: {sys.path}', file=sys.stderr)
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, Wedge
import numpy as np
import sys
import json

# eighty5labs brand colors
ORANGE = '#FF6B35'
TEAL = '#2DD4BF'
DARK_GRAY = '#1F2937'
LIGHT_GRAY = '#F3F4F6'
WHITE = '#FFFFFF'

def create_score_gauge(score, title, filename):
    """Create a gauge/meter visualization for audit scores"""
    fig, ax = plt.subplots(figsize=(8, 5), facecolor=WHITE)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')
    
    # Determine color based on score
    if score >= 70:
        color = TEAL
    elif score >= 40:
        color = ORANGE
    else:
        color = '#EF4444'  # Red for low scores
    
    # Draw background arc (gray)
    theta1, theta2 = 180, 0
    center = (5, 2)
    radius = 3
    
    # Background arc
    arc_bg = mpatches.Wedge(center, radius, theta1, theta2, 
                            width=0.4, facecolor=LIGHT_GRAY, 
                            edgecolor='none')
    ax.add_patch(arc_bg)
    
    # Score arc
    score_angle = theta1 + (score / 100) * (theta2 - theta1)
    arc_score = mpatches.Wedge(center, radius, theta1, score_angle,
                               width=0.4, facecolor=color,
                               edgecolor='none')
    ax.add_patch(arc_score)
    
    # Score text
    ax.text(5, 2, f'{score}', fontsize=72, fontweight='bold',
            ha='center', va='center', color=DARK_GRAY)
    ax.text(5, 1.2, '/100', fontsize=24, ha='center', va='center',
            color='#6B7280')
    
    # Title
    ax.text(5, 5, title, fontsize=28, fontweight='bold',
            ha='center', va='top', color=DARK_GRAY)
    
    plt.tight_layout()
    plt.savefig(filename, dpi=150, bbox_inches='tight', facecolor=WHITE)
    plt.close()
    print(f"Generated: {filename}")

def create_metric_card(value, label, sublabel, filename, color=ORANGE):
    """Create a metric card visualization"""
    fig, ax = plt.subplots(figsize=(6, 4), facecolor=WHITE)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    
    # Card background
    card = FancyBboxPatch((0.5, 1), 9, 8, boxstyle="round,pad=0.3",
                          facecolor=WHITE, edgecolor=LIGHT_GRAY,
                          linewidth=2)
    ax.add_patch(card)
    
    # Value
    ax.text(5, 6.5, str(value), fontsize=64, fontweight='bold',
            ha='center', va='center', color=color)
    
    # Label
    ax.text(5, 4.5, label.upper(), fontsize=16, fontweight='600',
            ha='center', va='center', color='#6B7280',
            style='normal', family='sans-serif')
    
    # Sublabel
    ax.text(5, 3.5, sublabel, fontsize=12,
            ha='center', va='center', color='#9CA3AF')
    
    plt.tight_layout()
    plt.savefig(filename, dpi=150, bbox_inches='tight', facecolor=WHITE)
    plt.close()
    print(f"Generated: {filename}")



def create_funnel_chart(stages, title, filename):
    """Create a funnel visualization for conversion analysis"""
    fig, ax = plt.subplots(figsize=(10, 8), facecolor=WHITE)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, len(stages) * 2)
    ax.axis('off')
    
    # Title
    ax.text(5, len(stages) * 2 - 0.5, title, fontsize=20, fontweight='bold',
            ha='center', va='top', color=DARK_GRAY)
    
    colors = [ORANGE, TEAL, '#FFA500', '#20B2AA']
    
    for i, stage in enumerate(stages):
        y = len(stages) * 2 - 2 - i * 1.8
        width = 8 - i * 1.5
        x_start = (10 - width) / 2
        
        color = colors[i % len(colors)]
        
        # Stage box
        box = FancyBboxPatch((x_start, y - 0.6), width, 1.2,
                            boxstyle="round,pad=0.05",
                            facecolor=color, edgecolor='none',
                            alpha=0.9)
        ax.add_patch(box)
        
        # Stage text
        ax.text(5, y, stage['label'], fontsize=14, fontweight='600',
                ha='center', va='center', color=WHITE)
        
        # Value text
        if 'value' in stage:
            ax.text(5, y - 0.35, stage['value'], fontsize=11,
                    ha='center', va='center', color=WHITE, alpha=0.9)
    
    plt.tight_layout()
    plt.savefig(filename, dpi=150, bbox_inches='tight', facecolor=WHITE)
    plt.close()
    print(f"Generated: {filename}")

def create_revenue_opportunity_chart(monthly_recovery, filename):
    """Create a revenue opportunity visualization"""
    fig, ax = plt.subplots(figsize=(10, 6), facecolor=WHITE)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    
    # Main card
    card = FancyBboxPatch((0.5, 2), 9, 6, boxstyle="round,pad=0.3",
                          facecolor='#FEF3C7', edgecolor=ORANGE,
                          linewidth=3)
    ax.add_patch(card)
    
    # Title
    ax.text(5, 7, 'Estimated Monthly Revenue Recovery', fontsize=18,
            fontweight='bold', ha='center', va='center', color=DARK_GRAY)
    
    # Amount
    ax.text(5, 5, f'${monthly_recovery:,}', fontsize=56, fontweight='bold',
            ha='center', va='center', color=ORANGE)
    
    # Subtitle
    ax.text(5, 3.5, 'Based on current lead volume and conversion gaps',
            fontsize=12, ha='center', va='center', color='#6B7280',
            style='italic')
    
    plt.tight_layout()
    plt.savefig(filename, dpi=150, bbox_inches='tight', facecolor=WHITE)
    plt.close()
    print(f"Generated: {filename}")

def main():
    if len(sys.argv) < 3:
        print("Usage: python generateVisuals.py <command> <data_json> <output_path>")
        sys.exit(1)
    
    command = sys.argv[1]
    data = json.loads(sys.argv[2])
    output_path = sys.argv[3]
    
    if command == "score_gauge":
        create_score_gauge(data['score'], data['title'], output_path)
    elif command == "metric_card":
        color = data.get('color', ORANGE)
        create_metric_card(data['value'], data['label'], data['sublabel'], 
                          output_path, color)
    elif command == "comparison_chart":
        create_comparison_chart(data, output_path)
    elif command == "ranking_comparison":
        create_ranking_comparison(data, output_path)
    elif command == "heat_map":
        create_heat_map(data, output_path)
    elif command == "funnel_chart":
        create_funnel_chart(data['stages'], data['title'], output_path)
    elif command == "revenue_opportunity":
        create_revenue_opportunity_chart(data['monthly_recovery'], output_path)
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

def create_comparison_chart(data, filename):
    """
    Create a comparison bar chart for business vs competitors
    data = {
        "businesses": ["Your Business", "Competitor A", "Competitor B"],
        "ratings": [4.8, 4.5, 4.2],
        "reviews": [150, 200, 80],
        "metric": "ratings"  # or "reviews"
    }
    """
    fig, ax = plt.subplots(figsize=(10, 6), facecolor=WHITE)
    
    businesses = data.get("businesses", [])
    values = data.get("ratings", []) if data.get("metric") == "ratings" else data.get("reviews", [])
    metric = data.get("metric", "ratings")
    
    # Create bars
    x = np.arange(len(businesses))
    colors = [ORANGE if i == 0 else LIGHT_GRAY for i in range(len(businesses))]
    bars = ax.bar(x, values, color=colors, edgecolor=DARK_GRAY, linewidth=1.5)
    
    # Highlight your business
    bars[0].set_color(TEAL)
    bars[0].set_edgecolor(ORANGE)
    bars[0].set_linewidth(2)
    
    # Add value labels on top of bars
    for i, (bar, value) in enumerate(zip(bars, values)):
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{value:.1f}' if metric == "ratings" else f'{int(value)}',
                ha='center', va='bottom', fontsize=12, fontweight='bold',
                color=DARK_GRAY)
    
    # Styling
    ax.set_xticks(x)
    ax.set_xticklabels(businesses, fontsize=11, color=DARK_GRAY)
    ax.set_ylabel(metric.capitalize(), fontsize=12, fontweight='bold', color=DARK_GRAY)
    ax.set_title(f'{metric.capitalize()} Comparison', fontsize=14, fontweight='bold', 
                 color=DARK_GRAY, pad=20)
    
    # Remove top and right spines
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color(LIGHT_GRAY)
    ax.spines['bottom'].set_color(LIGHT_GRAY)
    
    # Grid
    ax.yaxis.grid(True, linestyle='--', alpha=0.3, color=LIGHT_GRAY)
    ax.set_axisbelow(True)
    
    plt.tight_layout()
    plt.savefig(filename, dpi=150, facecolor=WHITE, edgecolor='none')
    plt.close()
    print(f"Generated: {filename}")


def create_ranking_comparison(data, filename):
    """
    Create a ranking position comparison chart
    data = {
        "queries": ["service near me", "service in city", "best service"],
        "your_positions": [3, 5, 1],
        "competitor_positions": [1, 2, 4]
    }
    """
    fig, ax = plt.subplots(figsize=(12, 6), facecolor=WHITE)
    
    queries = data.get("queries", [])
    your_positions = data.get("your_positions", [])
    competitor_positions = data.get("competitor_positions", [])
    
    x = np.arange(len(queries))
    width = 0.35
    
    # Create bars (inverted so lower position = higher bar)
    max_position = max(max(your_positions, default=0), max(competitor_positions, default=0))
    your_bars = ax.bar(x - width/2, [max_position - p + 1 for p in your_positions], 
                       width, label='Your Business', color=TEAL, edgecolor=DARK_GRAY, linewidth=1.5)
    comp_bars = ax.bar(x + width/2, [max_position - p + 1 for p in competitor_positions], 
                       width, label='Top Competitor', color=LIGHT_GRAY, edgecolor=DARK_GRAY, linewidth=1.5)
    
    # Add position labels
    for i, (your_pos, comp_pos) in enumerate(zip(your_positions, competitor_positions)):
        ax.text(i - width/2, max_position - your_pos + 1.5, f'#{your_pos}',
                ha='center', va='bottom', fontsize=10, fontweight='bold', color=DARK_GRAY)
        ax.text(i + width/2, max_position - comp_pos + 1.5, f'#{comp_pos}',
                ha='center', va='bottom', fontsize=10, fontweight='bold', color=DARK_GRAY)
    
    # Styling
    ax.set_xticks(x)
    ax.set_xticklabels(queries, fontsize=10, color=DARK_GRAY, rotation=15, ha='right')
    ax.set_ylabel('Ranking Position (lower is better)', fontsize=12, fontweight='bold', color=DARK_GRAY)
    ax.set_title('Search Ranking Comparison', fontsize=14, fontweight='bold', 
                 color=DARK_GRAY, pad=20)
    ax.legend(loc='upper right', frameon=False, fontsize=11)
    
    # Invert y-axis labels to show actual positions
    y_ticks = ax.get_yticks()
    ax.set_yticklabels([f'#{int(max_position - y + 1)}' if y > 0 else '' for y in y_ticks])
    
    # Remove top and right spines
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color(LIGHT_GRAY)
    ax.spines['bottom'].set_color(LIGHT_GRAY)
    
    plt.tight_layout()
    plt.savefig(filename, dpi=150, facecolor=WHITE, edgecolor='none')
    plt.close()
    print(f"Generated: {filename}")


def create_heat_map(data, filename):
    """
    Create a geographic heat map showing ranking coverage
    data = {
        "title": "Ranking Coverage Map",
        "grid": [
            [1, 3, 5, None, None],
            [2, 1, 4, 8, None],
            [3, 2, 3, 5, 10],
            [None, 4, 2, 4, 7],
            [None, None, 5, 6, 8]
        ],
        "center_label": "Your City"
    }
    None = not ranking, numbers = position
    """
    fig, ax = plt.subplots(figsize=(10, 8), facecolor=WHITE)
    
    grid = np.array(data.get("grid", []))
    title = data.get("title", "Ranking Coverage Map")
    center_label = data.get("center_label", "")
    
    # Create custom colormap: green (top 3), yellow (4-10), orange (11-20), red (20+), gray (None)
    from matplotlib.colors import ListedColormap, BoundaryNorm
    
    # Replace None with -1 for visualization
    grid_viz = np.where(grid == None, -1, grid).astype(float)
    
    # Create color map
    colors = ['#D1D5DB', '#10B981', '#FCD34D', '#F59E0B', '#EF4444']  # gray, green, yellow, orange, red
    n_bins = 5
    cmap = ListedColormap(colors)
    bounds = [-1.5, 0, 3.5, 10.5, 20.5, 100]
    norm = BoundaryNorm(bounds, cmap.N)
    
    # Create heatmap
    im = ax.imshow(grid_viz, cmap=cmap, norm=norm, aspect='auto')
    
    # Add grid lines
    ax.set_xticks(np.arange(grid.shape[1]+1)-.5, minor=True)
    ax.set_yticks(np.arange(grid.shape[0]+1)-.5, minor=True)
    ax.grid(which="minor", color=WHITE, linestyle='-', linewidth=2)
    ax.tick_params(which="minor", size=0)
    
    # Remove ticks
    ax.set_xticks([])
    ax.set_yticks([])
    
    # Add text annotations
    for i in range(grid.shape[0]):
        for j in range(grid.shape[1]):
            if grid[i, j] is not None and not np.isnan(grid[i, j]):
                text = ax.text(j, i, f'#{int(grid[i, j])}',
                             ha="center", va="center", color=WHITE, fontsize=12, fontweight='bold')
            elif grid[i, j] is None or np.isnan(grid[i, j]):
                text = ax.text(j, i, '—',
                             ha="center", va="center", color=DARK_GRAY, fontsize=14)
    
    # Add center label
    center_i, center_j = grid.shape[0] // 2, grid.shape[1] // 2
    ax.text(center_j, center_i + 0.3, center_label,
            ha="center", va="top", color=WHITE, fontsize=9, 
            style='italic', bbox=dict(boxstyle='round,pad=0.3', facecolor=DARK_GRAY, alpha=0.7))
    
    # Title
    ax.set_title(title, fontsize=14, fontweight='bold', color=DARK_GRAY, pad=20)
    
    # Add legend
    legend_labels = ['Not Ranking', 'Top 3', 'Top 10', 'Top 20', '20+']
    legend_colors = colors
    patches = [mpatches.Patch(color=color, label=label) for color, label in zip(legend_colors, legend_labels)]
    ax.legend(handles=patches, loc='upper left', bbox_to_anchor=(1.02, 1), 
             frameon=False, fontsize=10)
    
    plt.tight_layout()
    plt.savefig(filename, dpi=150, facecolor=WHITE, edgecolor='none', bbox_inches='tight')
    plt.close()
    print(f"Generated: {filename}")


if __name__ == "__main__":
    main()
