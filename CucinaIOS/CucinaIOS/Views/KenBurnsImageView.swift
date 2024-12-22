import SwiftUI

struct KenBurnsEffect: ViewModifier {
    let duration: Double
    let minZoom: CGFloat
    let maxZoom: CGFloat
    @State private var currentScale: CGFloat = 1.0
    @State private var currentOffset = CGSize.zero
    @State private var phase = 0
    
    init(duration: Double = 10.0, minZoom: CGFloat = 1.0, maxZoom: CGFloat = 1.5) {
        self.duration = duration
        self.minZoom = minZoom
        self.maxZoom = maxZoom
    }
    
    func body(content: Content) -> some View {
        content
            .scaleEffect(currentScale)
            .offset(x: currentOffset.width, y: currentOffset.height)
            .onAppear {
                startAnimation()
            }
    }
    
    private func startAnimation() {
        // Reset to initial state
        currentScale = minZoom
        currentOffset = .zero
        phase = 0
        
        animate()
    }
    
    private func animate() {
        let scales = [maxZoom, minZoom]
        let nextScale = scales[phase % 2]
        
        // Generate random offset within bounds
        let maxOffset = 50.0
        let nextOffset = CGSize(
            width: CGFloat.random(in: -maxOffset...maxOffset),
            height: CGFloat.random(in: -maxOffset...maxOffset)
        )
        
        withAnimation(.easeInOut(duration: duration)) {
            currentScale = nextScale
            currentOffset = nextOffset
        }
        
        // Schedule next animation
        DispatchQueue.main.asyncAfter(deadline: .now() + duration) {
            phase += 1
            animate()
        }
    }
}

extension View {
    func kenBurnsEffect(
        duration: Double = 10.0,
        minZoom: CGFloat = 1.0,
        maxZoom: CGFloat = 1.5
    ) -> some View {
        modifier(KenBurnsEffect(duration: duration, minZoom: minZoom, maxZoom: maxZoom))
    }
} 