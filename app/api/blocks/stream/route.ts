import dbConnect from '@/lib/db';
import Block from '@/lib/models/Block';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await dbConnect();

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        // Send an initial event to establish connection
        controller.enqueue(encoder.encode('event: connected\ndata: ok\n\n'));

        // Watch for new block insertions
        const changeStream = Block.watch([
          { $match: { operationType: 'insert' } }
        ]);

        changeStream.on('change', (change) => {
          if (change.operationType === 'insert') {
            const newBlock = change.fullDocument;
            const data = JSON.stringify(newBlock);
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        });

        changeStream.on('error', (err) => {
          console.error('ChangeStream error:', err);
          changeStream.close();
          controller.close();
        });

        // Clean up when client disconnects
        req.signal.addEventListener('abort', () => {
          changeStream.close();
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error("SSE Setup Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
