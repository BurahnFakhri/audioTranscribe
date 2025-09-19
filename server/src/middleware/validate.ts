import { Request, Response, NextFunction } from "express";
import { z } from "zod";

type SourceType = 'body' | 'params' | 'query'; 

export const validate = (schema: z.ZodTypeAny, source: SourceType = 'body' ) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse((req as any)[source]);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request',
                details: result.error.format()
            });
        }
        (req as any)[source] = result.data;
        next();
    };
}