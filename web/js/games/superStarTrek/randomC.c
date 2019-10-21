#ifndef RAND_MAX
#define RAND_MAX 32767
#endif

/* a critical hit occured */
	if (hit < (275.0-25.0*skill)*(1.0+0.5*Rand())) return;

	ncrit = 1.0 + hit/(500.0+100.0*Rand());
	proutn("***CRITICAL HIT--");
	/* Select devices and cause damage */
	for (l = 1; l <= ncrit; l++) {
		do {
			j = ndevice*Rand()+1.0;
			/* Cheat to prevent shuttle damage unless on ship */
		} while (damage[j] < 0.0 || (j == DSHUTTL && iscraft != 1) ||
#ifdef CLOAKING
				 (j == DCLOAK && ship != IHE) ||
#endif
				 j == DDRAY);
		cdam[l] = j;
		extradm = (hit*damfac)/(ncrit*(75.0+25.0*Rand()));
		damage[j] += extradm;
		if (l > 1) {
			for (ll=2; ll<=l && j != cdam[ll-1]; ll++) ;
			if (ll<=l) continue;
			ktr += 1;
			if (ktr==3) skip(1);
			proutn(" and ");
		}
		proutn(device[j]);
	}
	prout(" damaged.");


iscore = 10*d.killk + 50*d.killc + ithperd + iwon
			 - 100*d.basekl - 100*klship - 45*nhelp -5*d.starkl - casual
		 + 20*d.nromkl + 200*d.nsckill - 10*d.nplankl + dnromrem;

for (; k <= nenhr2; k++, kk++) {
		// wham is amount of energy to expend
		if ((wham = hits[k])==0) continue;
		dustfac = 0.9 + 0.01*Rand();
		// dustfac = .9 ish
		hit = wham*pow(dustfac,kdist[kk]);
		// .9 ish ** distance in sectors ) * amount
		kpini = kpower[kk];
		kp = fabs(kpini);
		if (phasefac*hit < kp) kp = phasefac*hit;
		kpower[kk] -= (kpower[kk] < 0 ? -kp: kp);
		kpow = kpower[kk];
		ii = kx[kk];
		jj = ky[kk];
		if (hit > 0.005) {
			cramf(hit, 0, 2);
			proutn(" unit hit on ");
		}
		else
			proutn("Very small hit on ");
		ienm = quad[ii][jj];
		crmena(0,ienm,2,ii,jj);
		skip(1);
		if (kpow == 0) {
			deadkl(ii, jj, ienm, ii, jj);
			if (d.remkl==0) finish(FWON);
			if (alldone) return;
			kk--; /* don't do the increment */
		}
		else /* decide whether or not to emasculate klingon */
			if (kpow > 0 && Rand() >= 0.9 &&
				kpow <= ((0.4 + 0.4*Rand())*kpini)) {
				proutn("***Mr. Spock-  \"Captain, the vessel at");
				cramlc(2,ii,jj);
				skip(1);
				prout("   has just lost its firepower.\"");
				kpower[kk] = -kpow;
			}
	}

// the phaser code
// energy = ship energy
// rpow is total fired amount
// ifast is high speed shields
//
hits[k] = aaitem; // amounts to fire ?
....
energy -= rpow;
chew();
if (ifast) {
energy -= 200.0;
if (checkshctrl(rpow)) return;
}
hittem(hits);

cramf
crami

//  prout(char pointer) print to stdout some string
//  proutn(char pointer) print to stdout some string and then a \n


int irec=(fabs(kpower[k])/(phasefac*pow(0.9,kdist[k])))*
								 (1.01+0.05*Rand()) + 1.0;
						kz = k;
						proutn("(");
						crami(irec, 1);
						proutn(")  ");

// convert angle ??
angle = ((15.0 - direc) * 0.5235988);
    // distance to travel x and y over (hyp = 1)
    // distance per unit of travel
    //
	deltax = -sin(angle);
	deltay = cos(angle);
	if (fabs(deltax) > fabs(deltay))
		bigger = fabs(deltax);
	else
		bigger = fabs(deltay);
	// find the bigger distance and then set the other in terms of it
	// why I don't know
	deltay /= bigger;
	deltax /= bigger;

	/* Move within the quadrant */
	quad[sectx][secty] = IHDOT; // set our spot to empty
	x = sectx;
	y = secty;
	n = 10.0*dist*bigger+0.5;
	// n seems to be the number of steps to take
	// this is insane

/* lines

static char line[128], *linep = line;
static int linecount;
*/
// fabs is floating point absolute values

// move command calls warp(1)
// make warpx entry then
/* Activate Warp Engines and pay the cost */
	lmove();
	if (alldone) return;
	energy -= dist*warpfac*warpfac*warpfac*(shldup+1);
	if (energy <= 0) finish(FNRG);
	Time = 10.0*dist/wfacsq;
	if (twarp) timwrp();
	if (blooey) {
		damage[DWARPEN] = damfac*(3.0*Rand()+1.0);
		skip(1);
		prout("Engineering to bridge--");
		prout("  Scott here.  The warp engines are damaged.");
		prout("  We'll have to reduce speed to warp 4.");
	}

// movement ???
direc = atan2(deltax, deltay)*1.90985932;
	if (direc < 0.0) direc += 12.0;

// Position ordinary Klingon Battle Cruisers
	krem = inkling - incom - d.nscrem;
	klumper = 0.25*skill*(9.0-length)+1.0;
	if (klumper > 9) klumper = 9; // Can't have more than 9 in quadrant
	do {
		double r = Rand();
		int klump = (1.0 - r*r)*klumper;
		if (klump > krem) klump = krem;
		krem -= klump;
		klump *= 100;
		do iran8(&ix, &iy);
		while (d.galaxy[ix][iy] + klump >= 1000);
		d.galaxy[ix][iy] += klump;
	} while (krem > 0);


// Put in a few black holes
	for (i = 1; i <= 3; i++)
		if (Rand() > 0.5) dropin(IHBLANK, &ix, &iy);

// find an empty spot in the sector and place something in it
// iquad is one of the IH* values which signify some object in a game
// modifies ix and iy to be the sector coordinates
// where it was placed
void dropin(int iquad, int *ix, int *iy) {
	do iran10(ix, iy);
	while (quad[*ix][*iy] != IHDOT);
	quad[*ix][*iy] = iquad;
}

// only one quadrant is loaded at a time
// the contents of the currently loaded quadrant
// uses indexes starting with 1 (so length is 11);
quad[11][11]
/*
newqad(int shutup) setup.c
interesting.... seems to position enemies in the quadrant when you arrive ?

*/
// intime ..... 7 * (1, 2, 4)
// skill .....
//
damfac = 0.5 * skill;
d.rembase = 3.0*Rand()+2.0;
inbase = d.rembase;
inplan = (PLNETMAX/2) + (PLNETMAX/2+1)*Rand();
d.nromrem = (2.0+Rand())*skill;
d.nscrem = (skill > SFAIR? 1 : 0);
d.remtime = 7.0 * length;
intime = d.remtime;
d.remkl = 2.0*intime*((skill+1 - 2*Rand())*skill*0.1+.15); // d.remkl and inkling includes commanders and SC
inkling = d.remkl;
incom = skill + 0.0625*inkling*Rand();
d.remcom= min(10, incom);
incom = d.remcom;
d.remres = (inkling+4*incom)*intime;
inresor = d.remres;


// .5 * 1.5 = .75 , presumably > 1 = has crystals
1.5*Rand();		// 1 in 3 chance of crystals


//#define inkling a.inkling		// Initial number of klingons
//#define incom a.incom			// Initian number of commanders
//nscrem,			// remaining super commanders
//nromkl,			// Romulans killed
//nromrem,		// Romulans remaining
// Position ordinary Klingon Battle Cruisers
	krem = inkling - incom - d.nscrem;
	klumper = 0.25*skill*(9.0-length)+1.0;
	if (klumper > 9) klumper = 9; // Can't have more than 9 in quadrant
	do {
		double r = Rand();
		int klump = (1.0 - r*r)*klumper;
		if (klump > krem) klump = krem;
		krem -= klump;
		klump *= 100;
		do iran8(&ix, &iy);
		while (d.galaxy[ix][iy] + klump >= 1000);
		d.galaxy[ix][iy] += klump;
	} while (krem > 0);

double Rand(void) {
  // 0 - 32767 / 32768
  // 0.0 - 0.99996948...
	return rand()/(1.0 + (double)RAND_MAX);
}

// chart print out
if (starch[i][j] < 0) // We know only about the bases
				printf("  .1.");
			else if (starch[i][j] == 0) // Unknown
				printf("  ...");
			else if (starch[i][j] > 999) // Memorized value
				printf("%5d", starch[i][j]-1000);
			else
				printf("%5d", d.galaxy[i][j]); // What is actually there (happens when value is 1)
// long range scan
// star chart seems to contain info for which
// quadrants you've scanned
if (x == 0 || x > 8 || y == 0 || y > 8)
				printf("   -1");
			else {
				printf("%5d", d.galaxy[x][y]);
				// If radio works, mark star chart so
				// it will show current information.
				// Otherwise mark with current
				// value which is fixed.
				starch[x][y] = damage[DRADIO] > 0 ? d.galaxy[x][y]+1000 :1;

// d.galaxy ???? contains the values for what is actually in the quadrant

// starch maybe is the star chart 2d array
// int boolean flags

// seemingly the klingons are just 100s in the galaxy location
// maybe that's the galaxy chart
/* Some type of a Klingon */
		d.galaxy[quadx][quady] -= 100;

// clearing out the starchart ???
		/* chart will no longer be updated because radio is dead */
	stdamtim = d.date;
	for (i=1; i <= 8 ; i++)
		for (j=1; j <= 8; j++)
			if (starch[i][j] == 1) starch[i][j] = d.galaxy[i][j]+1000;

// d.galaxy[x][y] = 1000 means supernova ?
if (d.galaxy[quadx][quady] == 1000 ||
				alldone) return; /* Supernova or finished */

// iran8 ....
// set i and j to random int range 1 - 8
void iran8(int *i, int *j) {
	*i = Rand()*8.0 + 1.0;
	*j = Rand()*8.0 + 1.0;
}

//
do iran8(&ix, &iy);
while (d.galaxy[ix][iy] >= 10);

// where's inbase set ?
damfac = 0.5 * skill;
	d.rembase = 3.0*Rand()+2.0;	// 2 - 5 bases
	inbase = d.rembase;
	inplan = (PLNETMAX/2) + (PLNETMAX/2+1)*Rand();
	d.nromrem = (2.0+Rand())*skill;
	d.nscrem = (skill > SFAIR? 1 : 0);
	d.remtime = 7.0 * length;
	intime = d.remtime;
	d.remkl = 2.0*intime*((skill+1 - 2*Rand())*skill*0.1+.15); // d.remkl and inkling includes commanders and SC
	inkling = d.remkl;
	incom = skill + 0.0625*inkling*Rand();
	d.remcom= min(10, incom);
	incom = d.remcom;
	d.remres = (inkling+4*incom)*intime;
	inresor = d.remres;
	if (inkling > 50) {
		inbase = (d.rembase += 1);
    }
#ifdef CAPTURE
	brigcapacity = 400;
    brigfree = brigcapacity;
    kcaptured = 0; // TAA fix 6/2015
#endif
#ifdef CLOAKING
    ncviol = 0; // TAA fix 6/2015
    iscloaked = FALSE;
    iscloaking = FALSE;
#endif




// setup.c line 262
// inbase = number of bases ?
// Locate star bases in galaxy
	for (i = 1; i <= inbase; i++) {
		int contflag;
		do {
			do iran8(&ix, &iy);
			while (d.galaxy[ix][iy] >= 10);
			contflag = FALSE;
			// look through the other bases and if we're too close then find another quadrant
			for (j = i-1; j > 0; j--) {
				// so if the square of the distance is stuff (so it's some measure of closeness)
				// then 75% of the time find another spot
				/* Improved placement algorithm to spread out bases */
				double distq = square(ix-d.baseqx[j]) + square(iy-d.baseqy[j]);	//pythag ?????!!!!!
				if (distq < 6.0*(6-inbase) && Rand() < 0.75) {
					contflag = TRUE;
#ifdef DEBUG
					printf("DEBUG: Abandoning base #%d at %d-%d\n", i, ix, iy);
#endif
					break;
				}
#ifdef DEBUG
				else if (distq < 6.0 * (6-inbase)) {
					printf("DEBUG: saving base #%d, close to #%d\n", i, j);
				}
#endif
			}
		} while (contflag);

		d.baseqx[i] = ix;	// star base quadrant x array
		d.baseqy[i] = iy; // star base quadrant y array
		starch[ix][iy] = -1; // set star chart to -1 meaning we know there's a base there
		d.galaxy[ix][iy] += 10;	// add the base to the galaxy chart thingy


/**
star placement code
every quadrant gets a number of stars
the number is between 1 and 10
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
