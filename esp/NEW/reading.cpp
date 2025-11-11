#include "reading.h"

static inline bool abs(float a) {
	return a < 0 ? a * -1 : a;
}

bool buffer_add(ReadingBuffer *buf, unsigned long timestamp, float value, float tolerance) {
	if (buf->size >= (READING_BUFFER_MAXLEN)) {
		return false;
	}

	if (buf->size > 0) {
		// Se o valor for muito parecido com o último valor guardado, descarte a leitura.
		if (abs(value - buf->values[buf->size - 1]) <= tolerance) {
			return false;
		}
	}

	buf->values[buf->size] = value;
	buf->timestamps[buf->size] = timestamp;
	buf->size++;
	return true;
}

void buffer_clear(ReadingBuffer *buf) {
	buf->size = 0;
}
