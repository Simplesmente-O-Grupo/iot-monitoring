#pragma once

#define READING_BUFFER_MAXLEN 40
typedef struct {
  float values[READING_BUFFER_MAXLEN];
  unsigned long timestamps[READING_BUFFER_MAXLEN];
  unsigned int size; // Quantidade de elementos
} ReadingBuffer;

bool buffer_add(ReadingBuffer *buf, unsigned long timestamp, float value);
void buffer_clear(ReadingBuffer *buf);

inline bool buffer_full(ReadingBuffer *buf) {
	return buf->size >= READING_BUFFER_MAXLEN;
}
