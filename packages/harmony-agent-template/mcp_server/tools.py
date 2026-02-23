"""
Example MCP tool server for Harmony agents.

MCP (Model Context Protocol) tools extend agent capabilities.
These can be connected to ADK agents via MCPToolset.
"""

from datetime import datetime, timezone


def lookup_order(order_id: str) -> dict:
    """Look up an order by ID.

    Args:
        order_id: The order identifier to look up.

    Returns:
        Order details including status and items.
    """
    # Placeholder implementation - connect to your order system
    return {
        "order_id": order_id,
        "status": "processing",
        "items": [
            {"name": "Widget A", "quantity": 2, "price": 19.99},
            {"name": "Widget B", "quantity": 1, "price": 29.99},
        ],
        "total": 69.97,
        "estimated_delivery": "2026-03-01",
    }


def check_inventory(product_name: str) -> dict:
    """Check inventory levels for a product.

    Args:
        product_name: The product name to check.

    Returns:
        Inventory status including quantity and warehouse location.
    """
    return {
        "product": product_name,
        "in_stock": True,
        "quantity": 150,
        "warehouse": "Berlin-01",
        "last_restocked": datetime.now(timezone.utc).isoformat(),
    }


def schedule_delivery(
    order_id: str,
    address: str,
    preferred_date: str = "",
) -> dict:
    """Schedule a delivery for an order.

    Args:
        order_id: The order to schedule delivery for.
        address: Delivery address.
        preferred_date: Optional preferred delivery date (YYYY-MM-DD).

    Returns:
        Delivery confirmation with tracking number.
    """
    import uuid

    return {
        "order_id": order_id,
        "tracking_number": f"HRM-{uuid.uuid4().hex[:8].upper()}",
        "address": address,
        "scheduled_date": preferred_date or "2026-03-01",
        "status": "scheduled",
    }
