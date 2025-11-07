#include "reading.h"

bool buffer_add(ReadingBuffer *buf, unsigned long timestamp, float value) {
	if (buf->size >= (READING_BUFFER_MAXLEN)) {
		return false;
	}

	buf->values[buf->size] = value;
	buf->timestamps[buf->size] = timestamp;
	buf->size++;
	return true;
}

void buffer_clear(ReadingBuffer *buf) {
	buf->size = 0;
}
