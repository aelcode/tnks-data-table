import { Hono } from "hono";

// ** Import DB
import { db } from "@/db";

// ** Import Schema
import { users } from "@/db/schema/tbl_users";
import { expenses } from "@/db/schema/tbl_expenses";

// ** Import Drizzle
import { eq } from "drizzle-orm";

// Create a new Hono app
const app = new Hono();

// DELETE /api/users/:id
app.delete("/:id", async (c) => {
  try {
    // Parse and validate user ID
    const userId = parseInt(c.req.param("id"), 10);
    
    if (isNaN(userId)) {
      return c.json(
        {
          success: false,
          error: "Invalid user ID",
        },
        400
      );
    }

    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return c.json(
        {
          success: false,
          error: "User not found",
        },
        404
      );
    }

    // First delete all expenses associated with the user
    await db.delete(expenses).where(eq(expenses.user_id, userId));

    // Then delete the user
    await db.delete(users).where(eq(users.id, userId));

    return c.json(
      {
        success: true,
        message: "User and associated expenses deleted successfully",
      },
      200
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return c.json(
      {
        success: false,
        error: "Failed to delete user",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default app; 