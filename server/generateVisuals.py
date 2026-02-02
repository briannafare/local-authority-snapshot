#!/usr/bin/env python3
"""
Generate branded visualizations for Local Authority Snapshot audits.
Uses eighty5labs brand colors: Orange (#FF6B35) and Teal (#2DD4BF)
"""

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

def create_comparison_chart(data, title, filename):
    """Create a horizontal bar chart for comparisons"""
    fig, ax = plt.subplots(figsize=(10, 6), facecolor=WHITE)
    
    categories = [item['category'] for item in data]
    values = [item['value'] for item in data]
    colors_list = [ORANGE if i % 2 == 0 else TEAL for i in range(len(categories))]
    
    y_pos = np.arange(len(categories))
    bars = ax.barh(y_pos, values, color=colors_list, height=0.6)
    
    ax.set_yticks(y_pos)
    ax.set_yticklabels(categories, fontsize=12)
    ax.set_xlabel('Score', fontsize=12, fontweight='600')
    ax.set_title(title, fontsize=18, fontweight='bold', pad=20, color=DARK_GRAY)
    ax.set_xlim(0, 100)
    
    # Add value labels on bars
    for i, (bar, value) in enumerate(zip(bars, values)):
        ax.text(value + 2, bar.get_y() + bar.get_height()/2,
                f'{value}', va='center', fontsize=11, fontweight='600')
    
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.grid(axis='x', alpha=0.3, linestyle='--')
    
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
        create_comparison_chart(data['data'], data['title'], output_path)
    elif command == "funnel_chart":
        create_funnel_chart(data['stages'], data['title'], output_path)
    elif command == "revenue_opportunity":
        create_revenue_opportunity_chart(data['monthly_recovery'], output_path)
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()
