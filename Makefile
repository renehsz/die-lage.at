.PHONY: dev deploy dist clean

all: dev

dev:
	npm run dev

deploy:
	npm run deploy:prod

# Regular build artifacts from webpack
DIST_FILES := $(patsubst build/%,dist/%, $(shell find build/ -type f))

#
# Additional build artifacts
# (those that aren't already handled by webpack)
#

# robots.txt
DIST_FILES += dist/robots.txt
dist/robots.txt: src/robots.txt
	@-mkdir -p $(@D)
	cp $< $@
	curl -L https://raw.githubusercontent.com/ai-robots-txt/ai.robots.txt/refs/heads/main/robots.txt | sed -e '/CCBot/d' -e '/Owler/d' >>$@
	printf "\nUser-agent: Bytespider\nDisallow: /\n" >>$@ # see https://github.com/ai-robots-txt/ai.robots.txt/issues/108
	printf "\nUser-agent: GenAI\nDisallow: /\n\n" >>$@ # see https://openwebsearch.eu/owler/

# ads.txt - see https://grapheneos.org/articles/sitewide-advertising-industry-opt-out
DIST_FILES += dist/ads.txt dist/app-ads.txt
dist/ads.txt:
	@-mkdir -p $(@D)
	echo 'placeholder.example.com, placeholder, DIRECT, placeholder' >$@
dist/app-ads.txt:
	@-mkdir -p $(@D)
	echo 'placeholder.example.com, placeholder, DIRECT, placeholder' >$@


#
# Compression
#
DIST_FILES_GZ  := $(patsubst dist/%,dist/%.gz,  $(DIST_FILES))
DIST_FILES_BR  := $(patsubst dist/%,dist/%.br,  $(DIST_FILES))
#DIST_FILES_ZST := $(patsubst dist/%,dist/%.zst, $(DIST_FILES))

DIST_FILES := $(DIST_FILES) $(DIST_FILES_GZ) $(DIST_FILES_BR) # $(DIST_FILES_ZST)

dist/%: build/%
	@-mkdir -p $(@D)
	cp $< $@

dist/%.gz: dist/%
	@-mkdir -p $(@D)
	gzip -kf9c $< >$@

dist/%.br: dist/%
	@-mkdir -p $(@D)
	brotli -kZ $< -o $@

# No zstd compression for now because nginx prefers zstd over brotli :-(
# see https://github.com/tokers/zstd-nginx-module/issues/40
#dist/%.zst: dist/%
#	@-mkdir -p $(@D)
#	zstd -k -f --no-check -19 $< -o $@

#
# Other rules
#
clean:
	-rm -rf $(DIST_FILES) $(BUILD_FILES) build/ dist/

dist: $(DIST_FILES)
