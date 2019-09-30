#ifndef RAND_MAX
#define RAND_MAX 32767
#endif

double Rand(void) {
  // 0 - 32767 / 32768
  // 0.0 - 0.99996948...
	return rand()/(1.0 + (double)RAND_MAX);
}


/**
star placement code
**/
/**
instar = 0;
	for (i=1; i<=8; i++)
		for (j=1; j<=8; j++) {
			int k = Rand()*9.0 + 1.0;
			instar += k;
			d.galaxy[i][j] = k;
		}
**/
