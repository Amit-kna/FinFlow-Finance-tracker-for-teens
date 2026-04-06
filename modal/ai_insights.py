import modal
import json
import random

app = modal.App("ai-insights")

image = modal.Image.debian_slim().pip_install("requests")

@app.function(image=image)
@modal.web_endpoint(method="POST")
def generate_insights(item: dict):
    """
    Analyzes user transactions and returns 3 personalized financial insights.
    Expected input: {"transactions": [...list of transactions...], "goals": [...list of goals...]}
    """
    transactions = item.get("transactions", [])
    
    if not transactions:
        default_insights = [
            "You don't have enough transactions yet for personalized insights.",
            "Try logging your expenses for a week to see where your money goes.",
            "Setting a savings goal is a great way to start building wealth."
        ]
        return {"status": "success", "insights": default_insights}
    
    # Basic logic to generate mock AI insights based on transaction count
    expenses = [t for t in transactions if t.get('type') == 'expense']
    income = [t for t in transactions if t.get('type') == 'income']
    
    insights = []
    
    if len(expenses) > 0:
        most_common_category = max(set([e.get('category') for e in expenses]), key=lambda x: [e.get('category') for e in expenses].count(x))
        insights.append(f"AI highlights that {most_common_category} is your most frequent expense category.")
        
    if sum([e.get('amount', 0) for e in expenses]) > sum([i.get('amount', 0) for i in income]):
        insights.append("You are currently spending more than you are earning! Time to budget.")
    else:
        insights.append("Great job keeping your expenses lower than your income.")
        
    insights.append("A little saved each day makes a big difference. Remember to update your goals!")
        
    return {"status": "success", "insights": insights[:3]}
